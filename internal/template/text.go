package template

import (
	"fmt"
	"strings"
	t "text/template"
)

// RenderTemplate takes a template string and data, returns the rendered string
func RenderTemplate(templateStr string, data any) (string, error) {
	templateObj, err := t.New("template").Parse(templateStr)
	if err != nil {
		return "", fmt.Errorf("failed to parse template: %w", err)
	}

	var builder strings.Builder
	err = templateObj.Execute(&builder, data)
	if err != nil {
		return "", fmt.Errorf("failed to execute template: %w", err)
	}

	return builder.String(), nil
}
