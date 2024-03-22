FROM golang:1.22.0-alpine

WORKDIR /app

COPY ./src .

EXPOSE 8080

CMD ["go", "run", "main.go"]

# Build command: docker build -t stopz-server .
# Run command: docker run -p 8000:8000 stopz-server