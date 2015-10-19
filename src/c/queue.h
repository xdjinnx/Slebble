#pragma once
#include "pebble.h"

typedef struct Queue {
    struct Queue *next;
    struct Queue *prev;

    void *value;
} Queue;

extern void* queue_pop(Queue *queue);
extern void* queue_peek(Queue *queue);
extern Queue* queue_queue(Queue *queue, void *value);
extern Queue* queue_create();
extern bool queue_destroy(Queue *queue);
extern bool queue_empty(Queue *queue);
extern int queue_length(Queue *queue);
