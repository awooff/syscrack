package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"markets/internal/app"
	"markets/internal/routes"
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

	log.Printf("Hey :) Listening onhttp://localhost%s", port)

	// GiveMeDaMoney()

	http.ListenAndServe(port, r)
}

func GiveMeDaMoney() {
	investors := []app.User{
		{Id: 1, AccountValue: 1000},
		{Id: 2, AccountValue: 2000},
		{Id: 3, AccountValue: 1500},
	}

	totalFundCharge, err := app.NewPercentage(0.25)
	if err != nil {
		fmt.Println("Error creating percentage:", err)
		return
	}

	fund := app.Fund{
		Id:                      1,
		FundManager:             app.User{Id: 0, AccountValue: 0},
		Name:                    "Growth Fund",
		MinimumInvestmentAmount: 500,
		TotalFundCharge:         totalFundCharge,
		Investors:               investors,
	}

	var wg sync.WaitGroup
	results := make(chan string, len(investors))

	wg.Add(1)
	go fund.TakeCharges(&wg, results)

	go func() {
		wg.Wait()
		close(results)
	}()

	for result := range results {
		fmt.Println(result)
	}

	for _, investor := range fund.Investors {
		fmt.Printf("Investor %d's updated account value: %.2f\n", investor.Id, float64(investor.AccountValue))
	}
}
