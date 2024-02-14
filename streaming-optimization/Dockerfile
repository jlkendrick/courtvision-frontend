FROM golang:1.22.0 as builder

WORKDIR /fbball/streaming-optimization/src

COPY src/go.mod ./

COPY src/ ./

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o stopz-server .

FROM alpine:3.19

WORKDIR /root/

COPY --from=builder /fbball/streaming-optimization/src/stopz-server .

EXPOSE 80

CMD ["./stopz-server"]

# Build command: docker build -t stopz-server .
# Run command: docker run -p 80:80 stopz-server