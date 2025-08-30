package main

import (
	"log"
	"net/http"
	"os"

	"markets/internal/routes"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	port := ":" + os.Getenv("PORT")
	if port == ":" {
		port = ":2700"
	}

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("welcome"))
	})

	r.Mount("/api", routes.InitializeRoutes())

	// start to intialise the kafka consumer
	//kafkaConsumer, err := InitialiseKafkaConsumerEntity()
	//if err != nil {
	//	panic(err)
	//}

	//err = RunKafkaConsumerEntity(kafkaConsumer)
	//if err != nil {
	//	panic(err)
	//}

	//log.Println("Kafka consumer is up and running! let's go :)")
	log.Printf("Hey :) Listening onhttp://localhost%s", port)

	http.ListenAndServe(port, r)
}
