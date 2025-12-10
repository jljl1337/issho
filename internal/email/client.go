package email

import (
	"context"
	"fmt"

	"github.com/wneessen/go-mail"

	"github.com/jljl1337/issho/internal/env"
)

type EmailClient struct {
	client *mail.Client
}

func NewEmailClient() (*EmailClient, error) {
	client, err := mail.NewClient(
		env.SMTPHost,
		mail.WithPort(env.SMTPPort),
		mail.WithSMTPAuth(mail.SMTPAuthLogin),
		mail.WithTLSPortPolicy(mail.TLSOpportunistic),
		mail.WithUsername(env.SMTPUsername),
		mail.WithPassword(env.SMTPPassword),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create email client: %v", err)
	}

	return &EmailClient{
		client: client,
	}, nil
}

func (ec *EmailClient) SendEmailTo(ctx context.Context, toAddress, subject, body string) error {
	return ec.SendEmail(ctx, []string{toAddress}, nil, nil, subject, body)
}

func (ec *EmailClient) SendEmail(ctx context.Context, toList, ccList, bccList []string, subject, body string) error {
	message := mail.NewMsg()
	if err := message.From(env.EmailFromAddress); err != nil {
		return fmt.Errorf("failed to set from address: %v", err)
	}
	if len(toList) > 0 {
		if err := message.To(toList...); err != nil {
			return fmt.Errorf("failed to set to addresses: %v", err)
		}
	}
	if len(ccList) > 0 {
		if err := message.Cc(ccList...); err != nil {
			return fmt.Errorf("failed to set cc addresses: %v", err)
		}
	}
	if len(bccList) > 0 {
		if err := message.Bcc(bccList...); err != nil {
			return fmt.Errorf("failed to set bcc addresses: %v", err)
		}
	}
	message.Subject(subject)
	message.SetBodyString(mail.TypeTextHTML, body)

	err := ec.client.DialAndSendWithContext(ctx, message)
	if err != nil {
		return fmt.Errorf("failed to send email: %v", err)
	}

	return nil
}
