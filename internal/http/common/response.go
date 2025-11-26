package common

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/jljl1337/issho/internal/service"
)

var genericErrorMap = map[service.ErrorCode]service.ErrorCode{
	service.ErrCodeBadRequest:    service.ErrCodeBadRequest,
	service.ErrCodeUnauthorized:  service.ErrCodeUnauthorized,
	service.ErrCodeForbidden:     service.ErrCodeForbidden,
	service.ErrCodeNotFound:      service.ErrCodeNotFound,
	service.ErrCodeConflict:      service.ErrCodeConflict,
	service.ErrCodeUnprocessable: service.ErrCodeUnprocessable,
	service.ErrCodeInternal:      service.ErrCodeInternal,

	service.ErrCodeUsernameTaken:      service.ErrCodeConflict,
	service.ErrCodeInvalidCredentials: service.ErrCodeUnauthorized,
}

var HTTPStatusMap = map[service.ErrorCode]int{
	service.ErrCodeBadRequest:    http.StatusBadRequest,
	service.ErrCodeUnauthorized:  http.StatusUnauthorized,
	service.ErrCodeForbidden:     http.StatusForbidden,
	service.ErrCodeNotFound:      http.StatusNotFound,
	service.ErrCodeConflict:      http.StatusConflict,
	service.ErrCodeUnprocessable: http.StatusUnprocessableEntity,
	service.ErrCodeInternal:      http.StatusInternalServerError,
}

var jsonCodeMap = map[service.ErrorCode]string{
	service.ErrCodeUsernameTaken:      "usernameTaken",
	service.ErrCodeInvalidCredentials: "invalidCredentials",
}

func WriteErrorResponse(w http.ResponseWriter, err error) {
	var serviceErr *service.ServiceError

	var httpStatus int
	var jsonCode string
	var message string

	if errors.As(err, &serviceErr) {
		genericErr := mapToGenericServiceError(serviceErr)
		httpStatus = mapToHTTPStatus(genericErr)
		if *genericErr == *serviceErr {
			jsonCode = strconv.Itoa(httpStatus)
		} else {
			jsonCode = mapToJSONCode(serviceErr)
		}
		message = genericErr.Message

		if httpStatus == http.StatusInternalServerError {
			slog.Error("Internal server error: service error: " + genericErr.Error())
			jsonCode = "500"
			message = "Internal server error"
		}
	} else {
		slog.Error("Internal server error: unknown error: " + err.Error())
		httpStatus = http.StatusInternalServerError
		jsonCode = "500"
		message = "Internal server error"
	}

	WriteJSONCodeMessageResponse(w, httpStatus, jsonCode, message)
}

func mapToGenericServiceError(err error) *service.ServiceError {
	var serviceErr *service.ServiceError
	if errors.As(err, &serviceErr) {
		if genericCode, exists := genericErrorMap[serviceErr.Code]; exists {
			return service.NewServiceError(genericCode, serviceErr.Message)
		}
	}
	return service.NewServiceError(service.ErrCodeInternal, err.Error())
}

func mapToHTTPStatus(err *service.ServiceError) int {
	if status, exists := HTTPStatusMap[err.Code]; exists {
		return status
	}
	return http.StatusInternalServerError
}

func mapToJSONCode(err *service.ServiceError) string {
	if code, exists := jsonCodeMap[err.Code]; exists {
		return code
	}
	return "500"
}

func WriteMessageResponse(w http.ResponseWriter, statusCode int, message string) {
	jsonCode := strconv.Itoa(statusCode)
	WriteJSONCodeMessageResponse(w, statusCode, jsonCode, message)
}

func WriteJSONCodeMessageResponse(w http.ResponseWriter, statusCode int, code string, message string) {
	response := map[string]string{
		"code":    code,
		"message": message,
	}
	WriteJSONResponse(w, statusCode, response)
}

func WriteJSONResponse(w http.ResponseWriter, statusCode int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}
