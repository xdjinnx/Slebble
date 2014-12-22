#ifndef __LINKEDLIST__
#define __LINKEDLIST__
	
struct node {
  int x;
  struct node *next;
};
	
extern void release(struct node *node);
extern struct node* pop(struct node *node);
extern struct node* push(struct node *node, struct node *head);
extern void que(struct node *node, struct node *tail);
	
#endif