package cron

import (
	"context"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"

	"github.com/jljl1337/issho/internal/email"
	"github.com/jljl1337/issho/internal/env"
	"github.com/jljl1337/issho/internal/generator"
	"github.com/jljl1337/issho/internal/repository"
)

func NewEmailTask(dbInstance *sqlx.DB, emailClient *email.EmailClient) func(context.Context) {
	return func(ctx context.Context) {
		queries := repository.New(dbInstance)

		for {
			select {
			case <-ctx.Done():
				slog.Info("Exiting email task")
				return
			default:
				pendingEmailTasks, err := queries.GetQueueTask(ctx, repository.GetQueueTaskParams{
					Lane:   env.QueueTaskLaneEmail,
					Status: env.QueueTaskStatusPending,
				})
				if err != nil {
					slog.Error("Failed to fetch pending emails: " + err.Error())
					continue
				}

				if len(pendingEmailTasks) == 0 {
					timer := time.NewTimer(10 * time.Second)
					select {
					case <-ctx.Done():
						slog.Info("Exiting email task")
						timer.Stop()
						return
					case <-timer.C:
						continue
					}
				}

				if len(pendingEmailTasks) > 1 {
					slog.Error(fmt.Sprintf("Expected to fetch 1 pending email task, but got %d", len(pendingEmailTasks)))
					continue
				}

				pendingEmailTask := pendingEmailTasks[0]

				// Send the email
				email, err := queries.GetEmailByID(ctx, pendingEmailTask.Payload)
				if err != nil {
					slog.Error("Failed to fetch email by ID " + pendingEmailTask.Payload + ": " + err.Error())
					continue
				}

				toList := strings.Split(email.ToAddress, ";")
				ccList := strings.Split(email.CcAddress, ";")
				bccList := strings.Split(email.BccAddress, ";")

				if len(toList) == 1 && toList[0] == "" {
					toList = []string{}
				}
				if len(ccList) == 1 && ccList[0] == "" {
					ccList = []string{}
				}
				if len(bccList) == 1 && bccList[0] == "" {
					bccList = []string{}
				}

				sendEmailSuccess := false

				err = emailClient.SendEmail(
					ctx,
					toList,
					ccList,
					bccList,
					email.Subject,
					email.Body,
				)
				if err != nil {
					slog.Error("Failed to send email for email ID " + email.ID + ": " + err.Error())
					continue
				}

				sendEmailSuccess = true

				queueTaskStatus := env.QueueTaskStatusFailed
				if sendEmailSuccess {
					queueTaskStatus = env.QueueTaskStatusSucceeded
				}

				emailStatus := env.EmailStatusFailed
				if sendEmailSuccess {
					emailStatus = env.EmailStatusSent
				}

				// Mark the task as completed
				now := generator.NowISO8601()

				err = queries.UpdateQueueTaskStatusByID(ctx, repository.UpdateQueueTaskStatusByIDParams{
					ID:        pendingEmailTask.ID,
					Status:    queueTaskStatus,
					UpdatedAt: now,
				})
				if err != nil {
					slog.Error("Failed to update email task status for email ID " + email.ID + ": " + err.Error())
					continue
				}

				err = queries.UpdateEmailStatusByID(ctx, repository.UpdateEmailStatusByIDParams{
					ID:        email.ID,
					Status:    emailStatus,
					UpdatedAt: now,
				})
				if err != nil {
					slog.Error("Failed to update email status for email ID " + email.ID + ": " + err.Error())
					continue
				}

				if !sendEmailSuccess {
					continue
				}

				slog.Info("Email sent for email ID " + email.ID)
			}
		}
	}
}
