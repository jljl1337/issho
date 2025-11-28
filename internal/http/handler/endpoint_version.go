package handler

import (
	"net/http"

	"github.com/jljl1337/issho/internal/env"
	"github.com/jljl1337/issho/internal/http/common"
)

type versionResponse struct {
	Version string `json:"version"`
}

func (h *EndpointHandler) registerVersionRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/version", h.version)
}

func (h *EndpointHandler) version(w http.ResponseWriter, r *http.Request) {
	common.WriteJSONResponse(w, http.StatusOK, versionResponse{Version: env.Version})
}
