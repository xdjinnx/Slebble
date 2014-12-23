#ifndef __LINKEDLIST__
#define __LINKEDLIST__
	
struct node {
  char title[32];
  struct node *next;
};
	
extern void linkedlist_release(struct node *node);
extern struct node* linkedlist_pop(struct node *node);
extern struct node* linkedlist_push(struct node *node, struct node *head);
extern void linkedlist_que(struct node *node, struct node *tail);
extern struct node* linkedlist_get(struct node *node, int i);
extern void linkedlist_log(struct node *node);
	
#endif