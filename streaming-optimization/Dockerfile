FROM golang:1.22.0-alpine3.19 AS builder

WORKDIR /build

COPY ./src /build

RUN GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o stopz-server .

FROM alpine:3.19

EXPOSE 80

WORKDIR /app

COPY --from=builder /build/stopz-server /app/

CMD ["./stopz-server"]

# Build command: docker build -t stopz-server .
# Run command: docker run -p 80:80 stopz-server