#pragma once
#include "pebble.h"

typedef struct Queue_Node {
    struct Queue_Node *prev;
    void *value;
} Queue_Node;

typedef struct Queue {
    Queue_Node *first;
    Queue_Node *last;
} Queue;

extern void *queue_pop(Queue *queue);
extern void *queue_peek(Queue *queue);
extern void queue_queue(Queue *queue, void *value);
extern Queue *queue_create();
extern bool queue_destroy(Queue *queue);
extern bool queue_empty(Queue *queue);
extern uint16_t queue_length(Queue *queue);
