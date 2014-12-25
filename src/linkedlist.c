#include "pebble.h"
#include "linkedlist.h"

//struct node *root;      
//root = (struct node *) malloc( sizeof(struct node) ); 
//root = malloc( sizeof(struct node) );  
	

void linkedlist_release(struct node *node) {
	if(node == NULL)
		return;
	linkedlist_release(node->next);
	free(node);
}

struct node* linkedlist_pop(struct node *node) {
	struct node *ret = node->next;
	free(node);
	return ret;
}

struct node* linkedlist_push(struct node *node, struct node *head) {
	head->next = node;
	return head;
}

void linkedlist_que(struct node *node, struct node *tail) {
	if(node->next == NULL) {
		node->next = tail;
		return;
	}
	linkedlist_que(node->next, tail);
}

int linkedlist_size(struct node *node) {
	if(node == NULL)
		return 0;
	
	return 1 + linkedlist_size(node->next);
}

struct node* linkedlist_get(struct node *node, int i) {
	if(i > 0)
		return linkedlist_get(node->next, i-1);
	return node;
}

void linkedlist_log(struct node *node) {
	if(node == NULL)
		return;
	APP_LOG(APP_LOG_LEVEL_INFO, "Pointer: %p", node);
	linkedlist_log(node->next);
}

struct node* linkedlist_sort(struct node *node ) {
	struct node *conductor;
	struct node *conductorbefore;
	int length = linkedlist_size(node);
	struct node *temp[length];
	
	for(int i = 0; i < length; i++) {
		temp[i] = node;
		node = node->next;
	}

	node = temp[0];
	node->next = 0;


	for(int i = 1; i < length; i++) {
		conductor = node;
		conductorbefore = NULL;
		while(true) {
			if(conductor->index > temp[i]->index) {
				if(conductorbefore == NULL) {
					node = temp[i];
					node->next = conductor;
				} else {
					conductorbefore->next = temp[i];
					temp[i]->next = conductor;
				}
				break;
			}
			if(conductor->next == NULL) {
				conductor->next = temp[i];
				temp[i]->next = 0;
				break;
			}
			conductorbefore = conductor;
			conductor = conductor->next;
		}
	}

	return node;

}