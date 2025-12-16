package service

import (
	"context"

	"github.com/jljl1337/issho/internal/crypto"
	"github.com/jljl1337/issho/internal/env"
	"github.com/jljl1337/issho/internal/generator"
	"github.com/jljl1337/issho/internal/repository"
)

func (s *EndpointService) RequestEmailVerification(ctx context.Context, user repository.User) error {
	tx, err := s.db.BeginTxx(ctx, nil)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to begin transaction: %v", err)
	}

	defer tx.Rollback()

	queries := repository.New(tx)

	if user.IsVerified {
		return NewServiceError(ErrCodeUnprocessable, "email is already verified")
	}

	now := generator.NowISO8601()

	existingVerifications, err := queries.GetValidEmailVerification(ctx, repository.GetValidEmailVerificationParams{
		UserID: user.ID,
		Type:   env.EmailVerificationTypeVerifyEmail,
		Status: env.EmailVerificationStatusPending,
		Now:    now,
	})
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to get existing email verifications: %v", err)
	}

	if len(existingVerifications) > 1 {
		return NewServiceError(ErrCodeInternal, "multiple valid email verifications found")
	}

	if len(existingVerifications) == 1 {
		// Skip creating a new verification if a valid one already exists
		return nil
	}

	// Generate verification code
	code := generator.NewToken(env.EmailVerificationCodeLength, env.EmailVerificationCodeCharset)

	err = queries.CreateEmailVerification(ctx, repository.EmailVerification{
		ID:        generator.NewULID(),
		UserID:    user.ID,
		Type:      env.EmailVerificationTypeVerifyEmail,
		Email:     user.Email,
		Code:      code,
		Status:    env.EmailVerificationStatusPending,
		ExpiresAt: generator.MinutesFromNowISO8601(env.EmailVerificationCodeLifetimeMin),
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to create email verification: %v", err)
	}

	email, err := queries.CreateEmail(ctx, repository.Email{
		ID:          generator.NewULID(),
		Type:        env.EmailTypeVerifyEmail,
		ToAddress:   user.Email,
		CcAddress:   "",
		BccAddress:  "",
		FromAddress: env.EmailFromAddress,
		Subject:     "Verify your email address",
		Body:        "Your verification code is: " + code,
		Status:      env.EmailStatusPending,
		CreatedAt:   now,
		UpdatedAt:   now,
	})
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to create email: %v", err)
	}

	err = queries.CreateQueueTask(ctx, repository.QueueTask{
		ID:        generator.NewULID(),
		Lane:      env.QueueTaskLaneEmail,
		Payload:   email.ID,
		Status:    env.QueueTaskStatusPending,
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to create queue task: %v", err)
	}

	err = tx.Commit()
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to commit transaction: %v", err)
	}

	return nil
}

type ConfirmEmailVerificationParams struct {
	User repository.User
	Code string
}

func (s *EndpointService) ConfirmEmailVerification(ctx context.Context, arg ConfirmEmailVerificationParams) error {
	tx, err := s.db.BeginTxx(ctx, nil)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to begin transaction: %v", err)
	}

	defer tx.Rollback()

	queries := repository.New(tx)

	if arg.User.IsVerified {
		return NewServiceError(ErrCodeUnprocessable, "email is already verified")
	}

	now := generator.NowISO8601()

	existingVerifications, err := queries.GetValidEmailVerification(ctx, repository.GetValidEmailVerificationParams{
		UserID: arg.User.ID,
		Type:   env.EmailVerificationTypeVerifyEmail,
		Status: env.EmailVerificationStatusPending,
		Now:    now,
	})
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to get existing email verifications: %v", err)
	}

	if len(existingVerifications) > 1 {
		return NewServiceError(ErrCodeInternal, "multiple valid email verifications found")
	}

	if len(existingVerifications) < 1 {
		return NewServiceError(ErrCodeVerificationFailed, "code is invalid or expired")
	}

	verification := existingVerifications[0]

	if verification.Code != arg.Code {
		return NewServiceError(ErrCodeVerificationFailed, "code is invalid or expired")
	}

	err = queries.UpdateEmailVerificationStatusByID(ctx, repository.UpdateEmailVerificationStatusByIDParams{
		ID:        verification.ID,
		Status:    env.EmailVerificationStatusVerified,
		UpdatedAt: now,
	})
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to update email verification status: %v", err)
	}

	err = queries.VerifyUser(ctx, repository.VerifyUserParams{
		ID:        arg.User.ID,
		UpdatedAt: now,
	})
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to verify user: %v", err)
	}

	err = tx.Commit()
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to commit transaction: %v", err)
	}

	return nil
}

func (s *EndpointService) UpdateUsernameByID(ctx context.Context, user repository.User, newUsername string) error {
	// Validate new username
	newUsernameValid, err := checkUsername(newUsername)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to validate new username: %v", err)
	}
	if !newUsernameValid {
		return NewServiceError(ErrCodeUnprocessable, "invalid new username format")
	}

	queries := repository.New(s.db)

	// Check if new username is the same as the old one or already taken
	users, err := queries.GetUserByUsername(ctx, newUsername)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to get user: %v", err)
	}

	if len(users) > 1 {
		return NewServiceError(ErrCodeInternal, "multiple users found with the same ID")
	}

	if len(users) == 1 {
		existingUser := users[0]

		if existingUser.ID == user.ID {
			return NewServiceError(ErrCodeUnprocessable, "new username must be different from the old username")
		} else {
			return NewServiceError(ErrCodeUsernameTaken, "username already taken")
		}
	}

	err = queries.UpdateUserUsername(ctx, repository.UpdateUserUsernameParams{
		ID:        user.ID,
		Username:  newUsername,
		UpdatedAt: generator.NowISO8601(),
	})
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to update username: %v", err)
	}

	return nil
}

func (s *EndpointService) UpdatePasswordByID(ctx context.Context, user repository.User, oldPassword, newPassword string) error {
	newPasswordValid, err := checkPassword(newPassword)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to validate new password: %v", err)
	}
	if !newPasswordValid {
		return NewServiceError(ErrCodeUnprocessable, "invalid new password format")
	}

	if oldPassword == newPassword {
		return NewServiceError(ErrCodeUnprocessable, "new password must be different from the old password")
	}

	queries := repository.New(s.db)

	if !crypto.CheckPasswordHash(oldPassword, user.PasswordHash) {
		return NewServiceError(ErrCodeUnprocessable, "old password is incorrect")
	}

	// Update password hash
	passwordHash, err := crypto.HashPassword(newPassword, env.PasswordBcryptCost)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to hash password: %v", err)
	}

	err = queries.UpdateUserPassword(ctx, repository.UpdateUserPasswordParams{
		PasswordHash: passwordHash,
		UpdatedAt:    generator.NowISO8601(),
		ID:           user.ID,
	})
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to update password: %v", err)
	}

	return nil
}

type RequestEmailChangeParams struct {
	User     repository.User
	NewEmail string
}

func (s *EndpointService) RequestEmailChange(ctx context.Context, arg RequestEmailChangeParams) error {
	// Validate new email
	newEmailValid, err := checkEmail(arg.NewEmail)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to validate new email: %v", err)
	}
	if !newEmailValid {
		return NewServiceError(ErrCodeUnprocessable, "invalid new email format")
	}

	tx, err := s.db.BeginTxx(ctx, nil)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to begin transaction: %v", err)
	}

	defer tx.Rollback()

	queries := repository.New(tx)

	// Check if new email is the same as the old one or already taken
	users, err := queries.GetUserByEmail(ctx, arg.NewEmail)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to get user: %v", err)
	}

	if len(users) > 1 {
		return NewServiceError(ErrCodeInternal, "multiple users found with the same email")
	}

	if len(users) == 1 {
		existingUser := users[0]

		if existingUser.ID == arg.User.ID {
			return NewServiceError(ErrCodeUnprocessable, "new email must be different from the old email")
		} else {
			return NewServiceError(ErrCodeEmailTaken, "email already taken")
		}
	}

	now := generator.NowISO8601()

	existingVerifications, err := queries.GetValidEmailVerification(ctx, repository.GetValidEmailVerificationParams{
		UserID: arg.User.ID,
		Type:   env.EmailVerificationTypeNewEmail,
		Status: env.EmailVerificationStatusPending,
		Now:    now,
	})
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to get existing email verifications: %v", err)
	}

	if len(existingVerifications) > 1 {
		return NewServiceError(ErrCodeInternal, "multiple valid email verifications found")
	}

	if len(existingVerifications) == 1 {
		// Skip creating a new verification if a valid one already exists, even
		// if it's for a different email
		return nil
	}

	// Generate verification code
	code := generator.NewToken(env.EmailVerificationCodeLength, env.EmailVerificationCodeCharset)

	err = queries.CreateEmailVerification(ctx, repository.EmailVerification{
		ID:        generator.NewULID(),
		UserID:    arg.User.ID,
		Type:      env.EmailVerificationTypeNewEmail,
		Email:     arg.NewEmail,
		Code:      code,
		Status:    env.EmailVerificationStatusPending,
		ExpiresAt: generator.MinutesFromNowISO8601(env.EmailVerificationCodeLifetimeMin),
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to create email verification: %v", err)
	}

	email, err := queries.CreateEmail(ctx, repository.Email{
		ID:          generator.NewULID(),
		Type:        env.EmailTypeNewEmail,
		ToAddress:   arg.NewEmail,
		CcAddress:   "",
		BccAddress:  "",
		FromAddress: env.EmailFromAddress,
		Subject:     "Verify your email address",
		Body:        "Your verification code is: " + code,
		Status:      env.EmailStatusPending,
		CreatedAt:   now,
		UpdatedAt:   now,
	})
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to create email: %v", err)
	}

	err = queries.CreateQueueTask(ctx, repository.QueueTask{
		ID:        generator.NewULID(),
		Lane:      env.QueueTaskLaneEmail,
		Payload:   email.ID,
		Status:    env.QueueTaskStatusPending,
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to create queue task: %v", err)
	}

	err = tx.Commit()
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to commit transaction: %v", err)
	}

	return nil
}

type ConfirmEmailChangeParams struct {
	User repository.User
	Code string
}

func (s *EndpointService) ConfirmEmailChange(ctx context.Context, arg ConfirmEmailChangeParams) error {
	tx, err := s.db.BeginTxx(ctx, nil)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to begin transaction: %v", err)
	}

	defer tx.Rollback()

	queries := repository.New(tx)

	now := generator.NowISO8601()

	existingVerifications, err := queries.GetValidEmailVerification(ctx, repository.GetValidEmailVerificationParams{
		UserID: arg.User.ID,
		Type:   env.EmailVerificationTypeNewEmail,
		Status: env.EmailVerificationStatusPending,
		Now:    now,
	})
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to get existing email verifications: %v", err)
	}

	if len(existingVerifications) > 1 {
		return NewServiceError(ErrCodeInternal, "multiple valid email verifications found")
	}

	if len(existingVerifications) < 1 {
		return NewServiceError(ErrCodeVerificationFailed, "code is invalid or expired")
	}

	verification := existingVerifications[0]

	if verification.Code != arg.Code {
		return NewServiceError(ErrCodeVerificationFailed, "code is invalid or expired")
	}

	err = queries.UpdateEmailVerificationStatusByID(ctx, repository.UpdateEmailVerificationStatusByIDParams{
		ID:        verification.ID,
		Status:    env.EmailVerificationStatusVerified,
		UpdatedAt: now,
	})
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to update email verification status: %v", err)
	}

	err = queries.UpdateUserEmail(ctx, repository.UpdateUserEmailParams{
		ID:        arg.User.ID,
		Email:     verification.Email,
		UpdatedAt: now,
	})
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to update user email: %v", err)
	}

	if !arg.User.IsVerified {
		err = queries.VerifyUser(ctx, repository.VerifyUserParams{
			ID:        arg.User.ID,
			UpdatedAt: now,
		})
		if err != nil {
			return NewServiceErrorf(ErrCodeInternal, "failed to verify user: %v", err)
		}
	}

	err = tx.Commit()
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to commit transaction: %v", err)
	}

	return nil
}

func (s *EndpointService) UpdateLanguageByID(ctx context.Context, user repository.User, languageCode string) error {
	languageCodeValid := checkLanguageCode(languageCode)
	if !languageCodeValid {
		return NewServiceError(ErrCodeUnprocessable, "invalid language code")
	}

	queries := repository.New(s.db)

	err := queries.UpdateUserLanguage(ctx, repository.UpdateUserLanguageParams{
		ID:           user.ID,
		LanguageCode: languageCode,
		UpdatedAt:    generator.NowISO8601(),
	})
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to update language: %v", err)
	}

	return nil
}

func (s *EndpointService) DeleteUserByID(ctx context.Context, user repository.User) error {
	queries := repository.New(s.db)

	err := queries.DeleteUser(ctx, user.ID)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to delete user: %v", err)
	}

	return nil
}
