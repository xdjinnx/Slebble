#include <pebble.h>
#include "linkedlist.h"


void test()
{	
	/* This will be the unchanging first node */
    struct node *root;      

    /* Now root points to a node struct */
    root = (struct node *) malloc( sizeof(struct node) ); 
    root = malloc( sizeof(struct node) );  
	
	/* The node root points to has its next pointer equal to a null pointer set */
    root->next = 0; 
    /* By using the -> operator, you can modify what the node, a pointer, (root in this case) points to. */;
    root->x = 5;
	
}


/*
void traverseLinkedList(struct node *node) {
	if(node == NULL)
		return;
	node->x = 0;
	traverseLinkedList(node->next);
}
*/

void release(struct node *node) {
	if(node == NULL)
		return;
	release(node->next);
	free(node);
}

struct node* pop(struct node *node) {
	struct node *ret = node->next;
	free(node);
	return ret;
}

struct node* push(struct node *node, struct node *head) {
	return head->next = node;
}

void que(struct node *node, struct node *tail) {
	if(node->next == NULL) {
		node->next = tail;
		return;
	}
	que(node->next, tail);
}