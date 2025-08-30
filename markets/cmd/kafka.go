package main

import (
	"errors"
	"log"
	"os"
	"time"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
)

func InitialiseKafkaConsumerEntity() (*kafka.Consumer, error) {
	kafkaBootstrapServers := os.Getenv("KAFKA_BOOTSTRAP_SERVERS")
	kafkaGroupID := os.Getenv("KAFKA_GROUP_ID")

	if kafkaBootstrapServers == "" {
		kafkaBootstrapServers = "localhost"
	}

	if kafkaGroupID == "" {
		kafkaGroupID = "myGroup"
	}

	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers": kafkaBootstrapServers,
		"group.id":          kafkaGroupID,
		"auto.offset.reset": "earliest",
	})
	if err != nil {
		return nil, errors.New("failed to initialise Kafka consumer")
	}

	if err := c.SubscribeTopics([]string{"myTopic", "^aRegex.*[Tt]opic"}, nil); err != nil {
		return nil, err
	}

	return c, nil
}

func RunKafkaConsumerEntity(kafkaConsumerEntity *kafka.Consumer) error {
	defer kafkaConsumerEntity.Close()

	for {
		msg, err := kafkaConsumerEntity.ReadMessage(time.Second)
		if err == nil {
			log.Printf("Message on %s: %s\n", msg.TopicPartition, string(msg.Value))
		} else if kafkaErr, ok := err.(kafka.Error); ok && !kafkaErr.IsTimeout() {
			log.Fatalf("Consumer Error :: %v (%v)\n", err, msg)
			return errors.New("consumer error :(")
		}
	}
}
