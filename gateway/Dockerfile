FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git gcc musl-dev curl

# Copy go mod file and source code
COPY go.mod .
COPY . .

# Build binary (Go will download dependencies as needed)
# Use -mod=mod to allow go to update modules and -trimpath for reproducible builds
RUN CGO_ENABLED=1 GOOS=linux GOSUMDB=off go build -mod=mod -o gateway .

# Final stage
FROM alpine:3.18

RUN apk --no-cache add ca-certificates curl

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/gateway .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["./gateway"]
