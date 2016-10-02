#include "queue.h"

void *queue_pop(Queue *queue) {
    Queue_Node *node = queue->last;
    queue->last = queue->last->prev;

    void *ret = node->value;
    free(node);

    return ret;
}

void *queue_peek(Queue *queue) {
    return queue->last->value;
}

void queue_queue(Queue *queue, void *value) {
    Queue_Node *node = malloc(sizeof(Queue_Node));
    node->value = value;
    node->prev = NULL;

    if (queue->last == NULL) {
        queue->first = node;
        queue->last = node;
        return;
    }

    queue->first->prev = node;
    queue->first = node;
}

Queue *queue_create() {
    Queue *queue = malloc(sizeof(Queue));
    queue->first = NULL;
    queue->last = NULL;
    return queue;
}

bool queue_empty(Queue *queue) {
    return queue->last == NULL;
}

bool queue_destroy(Queue *queue) {
    if (queue_empty(queue)) {
        free(queue);
        return true;
    }
    return false;
}

uint16_t queue_length(Queue *queue) {
    uint16_t length = 0;
    Queue_Node *node = queue->last;

    while (node != NULL) {
        length++;
        node = node->prev;
    }
    return length;
}
