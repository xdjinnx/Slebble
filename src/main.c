#include "pebble.h"
#include "menu.h"
#include "event.h"

Menu *menu;
int updates = 0;

void tick_handler(struct tm *tick_time, TimeUnits units_changed) {
    event_tick_handler(menu->data);
}

void remove_callback_handler(void *data) {
    Menu *temp = data;
    menu = menu->menu;
    free(temp);

}

void select_callback(MenuLayer *menu_layer, MenuIndex *cell_index, void *data) {

    Menu *temp = menu;
    menu = menu_create(RESOURCE_ID_SLEBBLE_LOADING_BLACK, (MenuCallbacks){
            .select_click = NULL,
            .remove_callback = &remove_callback_handler,
    });

    menu->menu = temp;

    send_appmessage(cell_index->row);
}

void view_update(int size, char *title, int index, char *row_title, char *row_subtitle) {
    menu_update(menu, size, title, index, row_title, row_subtitle);
    updates++;
    if(updates >= size)
        menu_remove_load_image(menu);
}

int main(void) {

    app_message_register_inbox_received(in_received_handler);
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
