package logx

import (
	"os"
	"time"

	"github.com/rs/zerolog"
)

var Logger zerolog.Logger

func Init(pretty bool) {
	if pretty {
		// pretty console writer (good for dev)
		output := zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: time.RFC3339}
		Logger = zerolog.New(output).With().Timestamp().Logger()
	} else {
		// raw JSON logs (better for prod/infra)
		Logger = zerolog.New(os.Stderr).With().Timestamp().Logger()
	}
}

func Info() *zerolog.Event  { return Logger.Info() }
func Warn() *zerolog.Event  { return Logger.Warn() }
func Error() *zerolog.Event { return Logger.Error() }
func Fatal() *zerolog.Event { return Logger.Fatal() }
func Debug() *zerolog.Event { return Logger.Fatal() }
