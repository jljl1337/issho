package service

import (
	"regexp"
)

var mapLanguageCodeAllowed = map[string]bool{
	"en-US": true,
	"zh-HK": true,
}

func checkUsername(username string) (bool, error) {
	r, err := regexp.Compile("^[a-zA-Z0-9_]{3,30}$")
	if err != nil {
		return false, err
	}

	return r.MatchString(username), nil
}

func checkPassword(password string) (bool, error) {
	r, err := regexp.Compile("^[A-Za-z0-9!@#$%^&*]{8,64}$")
	if err != nil {
		return false, err
	}

	return r.MatchString(password), nil
}

func checkLanguageCode(languageCode string) bool {
	_, exists := mapLanguageCodeAllowed[languageCode]
	return exists
}

func checkEmail(email string) (bool, error) {
	r, err := regexp.Compile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if err != nil {
		return false, err
	}

	return r.MatchString(email), nil
}
