package main

import (
    "log"
    "net/http"
    "os"
   // "path/filepath"
)


func main() {
    fs := http.FileServer(http.Dir("./"))
    http.Handle("/", fs)

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    log.Printf("Server is running on http://localhost:%s", port)
    log.Fatal(http.ListenAndServe(":"+port, nil))
}