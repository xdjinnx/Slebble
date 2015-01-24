#include "pebble.h"
#include "menu.h"

int main(void) {

    menu_create();

	app_event_loop();
}
