#include "queue.h"

void* queue_pop(Queue *queue){
  if(queue->next == queue->prev) {
    queue->next = NULL;
    queue->prev = NULL;
    return queue->value;
  }

  void *ret = queue->prev->value;
  Queue *temp_queue = queue->prev->prev;

  queue->prev->prev->next = queue;
  queue->prev->next = NULL;
  queue_destroy(queue->prev);
  queue->prev = temp_queue;

  return ret;
}

void* queue_peek(Queue *queue) {
  return queue->prev->value;
}

Queue* queue_queue(Queue *queue, void *value) {
  if(queue_empty(queue)) {
    queue->next = queue;
    queue->prev = queue;
    queue->value = value;
    return queue;
  }

  Queue *new_queue = queue_create();
  new_queue->value = value;
  new_queue->next = queue;
  new_queue->prev = queue->prev;
  queue->prev->next = new_queue;
  queue->prev  = new_queue;
  return new_queue;
}

Queue* queue_create() {
  Queue *queue = malloc(sizeof(Queue));
  queue->next = NULL;
  queue->prev = NULL;
  queue->value = NULL;
  return queue;
}

bool queue_empty(Queue *queue) {
  return queue->next == NULL;
}

bool queue_destroy(Queue *queue) {
  if(queue_empty(queue)) {
    free(queue);
    return true;
  }
  return false;
}

int queue_length(Queue *queue) {
  if(queue_empty(queue))
    return 0;
  int length = 1;
  Queue *temp = queue->next;

  while(queue != temp) {
    length++;
    temp = temp->next;
  }
  return length;
}
