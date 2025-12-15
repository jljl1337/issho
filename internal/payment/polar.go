package payment

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type PolarProvider struct {
	baseURL     string
	accessToken string
}

func NewPolarProvider(accessToken string, isSandbox bool) *PolarProvider {
	baseURL := "https://api.polar.sh/v1"
	if isSandbox {
		baseURL = "https://sandbox-api.polar.sh/v1"
	}

	return &PolarProvider{
		baseURL:     baseURL,
		accessToken: accessToken,
	}
}

var mapAllowedMethods = map[string]bool{
	http.MethodGet:    true,
	http.MethodPost:   true,
	http.MethodPut:    true,
	http.MethodPatch:  true,
	http.MethodDelete: true,
}

func (p *PolarProvider) sendRequest(method, endpoint string, body any, response any) error {
	if !mapAllowedMethods[method] {
		return fmt.Errorf("invalid HTTP method: %s", method)
	}

	client := &http.Client{}

	reqBody, err := json.Marshal(body)
	if err != nil {
		return fmt.Errorf("failed to marshal request body: %w", err)
	}

	req, err := http.NewRequest(method, p.baseURL+endpoint, bytes.NewBuffer(reqBody))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+p.accessToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		bodyBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			return fmt.Errorf("failed to read response body: %w", err)
		}

		// Convert the byte slice to a string
		bodyString := string(bodyBytes)

		return fmt.Errorf("received non-2xx response: %d, with body: %v", resp.StatusCode, bodyString)
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return fmt.Errorf("failed to decode response body: %w", err)
	}

	return nil
}
