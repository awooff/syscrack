package main

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"markets/internal/logx"
	"markets/internal/middleware"
	"markets/internal/routes"

	"github.com/go-chi/chi/v5"
)

func main() {
	port := ":" + os.Getenv("PORT")
	if port == ":" {
		port = ":2700"
	}

	r := chi.NewRouter()

	middleware.Init(r)

	r.Mount("/api", routes.Init())

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
	logx.Init(true)

	logx.Logger.Info().Msg(banner)

	logx.Logger.Info().Msg("server starting up on http://localhost" + port)

	// print out our routes
	chi.Walk(r, func(method string, route string, handler http.Handler, middlewares ...func(http.Handler) http.Handler) error {
		fmt.Printf("[%s]: '%s' has %d middlewares\n", method, route, len(middlewares))
		return nil
	})

	http.ListenAndServe(port, r)
}

func Announce(msg string) {
	padding := 2
	width := len(msg) + (padding * 2)
	border := "+" + strings.Repeat("-", width) + "+"
	inner := "|" + strings.Repeat(" ", padding) + msg + strings.Repeat(" ", padding) + "|"

	fmt.Println(border)
	fmt.Println(inner)
	fmt.Println(border)
}

var banner string = `
      /.m.\
     /.mnnm.\                                              ___
    |.mmnvvnm.\.                                     .,,,/` + "`" + `mmm.\
    |.mmnnvvnm.\:;,.                           ..,,;;;/.mmnnnmm.\
    |.mmnnvvnm.\::;;,                    .,;;;;;;;;/.mmmnnvvnnm.|
     \ mmnnnvvnm.\::;::.sSSs      sSSs ,;;;;;;;;;;/.mmmnnvvvnnmm'/
       \` + "`" + `mmnnnvvnm.\::;::.SSSS,,,,,,SSSS:::::::;;;/.mmmnnvvvnnmmm'/
          \` + "`" + `mnvvnm.\::%%%;;;;;;;;;;;%%%%:::::;/.mnnvvvvnnmmmmm'/
             \` + "`" + `mmmm.%%;;;;;%%%%%%%%%%%%%%%::/.mnnvvvnnmmmmm'/ '
                \` + "`" + `%%;;;;%%%%s&&&&&&&&&s%%%%mmmnnnmmmmmm'/ '
     |            %;;;%%%%s&&.%%%%%%.%&&%mmmmmmmmmm'/ '
\    |    /       %;;%%%%&&.%;` + "`" + `    '%.&&%%%////// '
  \  |  /         %%%%%%s&.%% #     %.&&%%%%%//%
    \  .:::::.  ,;%%%%s&&&&.%;     ;.&&%%%%%%%%/,
-!!!- ::#:::::%%%%%%s&&&&&&&&&&&&&&&&&%%%%%%%%%%%
    / :##:::::&&&&&&&&&&&&&&&&&&&&&%%%%%%%%%%%%%%,
  /  | ` + "`" + `:#:::&&&&&&&&&&&&&&&&&&&&&&&&%%%%%%%%%%%%%
     |       ` + "`" + `&&&&&&&&&,&&&&&&&&&&&&SS%%%%%%%%%%%%%
               ` + "`" + `~~~~~'~~        SSSSSSS%%%%%%%%%%%%%
                               SSSSSSS%%%%%%%%%%%%%%
                              SSSSSSSSSS%%%%%%%%%%%%%.
                            SSSSSSSSSSSS%%%%%%%%%%%%%%
                          SSSSSSSSSSSSS%%%%%%%%%%%%%%%.
                        SSSSSSSSSSSSSSS%%%%%%%%%%%%%%%%
                      SSSSSSSSSSSSSSSS%%%%%%%%%%%%%%%%%.
                    SSSSSSSSSSSSSSSSS%%%%%%%%%%%%%%%%%%%
                  SSSSSSSSSSSSSSSSSS%%%%%%%%%%%%%%%%%%%%.
    
	`
