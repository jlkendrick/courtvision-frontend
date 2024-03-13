package main

import (
	"io"
	"bytes"
	"net/http"
	"github.com/gin-gonic/gin"
)


func main() {
	// Create a Gin router
	r := gin.Default()

	// Route for validating and caching a user's league information
	r.POST("/validate_league", handleValidateLeague)

	r.Run(":82")
}

func handleValidateLeague(c *gin.Context) {

	// Attempt to read the request body
	body, err := io.ReadAll(c.Request.Body)
    if err != nil {
        c.AbortWithError(http.StatusBadRequest, err)
        return
    }

	// Send POST request to server
	url := "http://127.0.0.1:8000/validate_league/"
	req, err := http.NewRequest(c.Request.Method, url, bytes.NewBuffer(body))
	if err != nil {
    	c.AbortWithError(http.StatusInternalServerError, err)
    	return
    }

	// Copy headers
	// req.Header.Set("Content-Type", c.Request.Header.Get("Content-Type"))

	// Send request to backend
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	defer resp.Body.Close()

	c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
    c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS") // Adjust methods as needed
    c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type") // Adjust headers as needed

	// Copy response back to the frontend
	c.DataFromReader(resp.StatusCode, resp.ContentLength, resp.Header.Get("Content-Type"), resp.Body, nil)

}
