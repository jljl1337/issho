package generator

import (
	"time"

	"github.com/jljl1337/issho/internal/format"
)

func NowISO8601() string {
	return format.TimeToISO8601(time.Now())
}

func MinutesFromNowISO8601(minutes int) string {
	return DurationFromNowISO8601(time.Duration(minutes) * time.Minute)
}

func DurationFromNowISO8601(duration time.Duration) string {
	return format.TimeToISO8601(time.Now().Add(duration))
}
