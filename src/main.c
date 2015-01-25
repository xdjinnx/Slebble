#include "pebble.h"
#include "menu.h"
#include "event.h"

/*
Add code for the callback from app_message, we want the main to control all interaction with the view.
 */

Menu *menu;

void tick_handler(struct tm *tick_time, TimeUnits units_changed) {
    event_tick_handler(menu->data);
}

void select_callback(MenuLayer *menu_layer, MenuIndex *cell_index, void *data) {

}

void remove_callback_handler(void *menu) {

}

void view_update(int size, char *title, int index, char *row_title, char *row_subtitle) {
    menu_update(menu, size, title, index, row_title, row_subtitle);
}

int main(void) {

    //app_message_register_inbox_received(in_received_handler);
    app_message_register_inbox_dropped(in_dropped_handler);

    menu = menu_create(RESOURCE_ID_SLEBBLE_START_BLACK, (MenuCallbacks){
            .select_click = &select_callback,
            .remove_callback = &remove_callback_handler,
    });

    event_set_view_update(&view_update);

    tick_timer_service_subscribe(MINUTE_UNIT, tick_handler);

    app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());

	app_event_loop();
}
