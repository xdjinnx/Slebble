#include "pebble.h"
#include "menu.h"
#include "event.h"

Menu *menu;
int updates = 0;

void tick_handler(struct tm *tick_time, TimeUnits units_changed) {
    event_tick_handler(menu->size, menu->data_int);
}

void remove_callback_handler(void *data) {
    Menu* temp = data;
    menu = temp;
}

void select_callback(MenuLayer *menu_layer, MenuIndex *cell_index, void *data) {

    event_set_click_data(menu->row_title[cell_index->row]);

    Menu *temp = menu;
    menu = menu_create(RESOURCE_ID_SLEBBLE_LOADING_BLACK, (MenuCallbacks){
            .select_click = NULL,
            .remove_callback = &remove_callback_handler,
    });

    menu->menu = temp;

    updates = 0;
    if(app_comm_get_sniff_interval() == SNIFF_INTERVAL_NORMAL)
        app_comm_set_sniff_interval(SNIFF_INTERVAL_REDUCED);
    send_appmessage(cell_index->row);
    
}

void view_update(int size, char *title, int index, char *row_title, char *row_subtitle, int data_int, char *data_char) {
    menu_update(menu, size, title, index, row_title, row_subtitle, data_int, data_char);
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

    //tick_timer_service_subscribe(MINUTE_UNIT, tick_handler);

    app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());
    app_comm_set_sniff_interval(SNIFF_INTERVAL_REDUCED);

    app_event_loop();
}
