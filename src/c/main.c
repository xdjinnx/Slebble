#include "event.h"
#include "menu/menu.h"
#include "pebble.h"
#include "row_type/departure.h"
#include "row_type/station.h"
#include "storage/storage.h"

Menu *menu;
bool first_tick = false;

void tick_handler(struct tm *tick_time, TimeUnits units_changed) {
    if (!first_tick) {
        first_tick = true;
        return;
    }

    for (int i = 0; i < menu->size; i++) {
        Departure *departure = menu->data[i];
        if (departure->time_left > 0) {
            departure->time_left--;
        }
    }

    menu_layer_reload_data(menu->layer);

    update_appmessage();
}

void remove_callback_handler(void *data) {
    Menu *temp = data;
    menu = temp;
    tick_timer_service_unsubscribe();
}

void select_nearby_callback(MenuLayer *menu_layer, MenuIndex *cell_index, void *data) {
    int row_clicked = cell_index->row;
    Station *station = menu->data[row_clicked];
    char *click_data = station->title;

    event_set_click_data(click_data);

    Menu *temp = menu;
    menu = menu_create(RESOURCE_ID_SLEBBLE_LOADING_BLACK,
                       (MenuCallbacks){
                           .select_click = NULL,
                           .remove_callback = &remove_callback_handler,
                       });

    menu->menu = temp;

    if (app_comm_get_sniff_interval() == SNIFF_INTERVAL_NORMAL) {
        app_comm_set_sniff_interval(SNIFF_INTERVAL_REDUCED);
    }
    send_appmessage(row_clicked, 1);

    first_tick = false;
    tick_timer_service_subscribe(MINUTE_UNIT, tick_handler);
}

void select_callback(MenuLayer *menu_layer, MenuIndex *cell_index, void *data) {
    char *click_data;
    int row_clicked = cell_index->row + 1;

    if (cell_index->section == 0) {
        click_data = "Nearby Stations";
        row_clicked--;
    } else {
        Station *station = menu->data[cell_index->row];
        click_data = station->title;
    }

    if (strcmp(click_data, "No configuration") == 0) {
        return;
    }

    event_set_click_data(click_data);

    Menu *temp = menu;
    if (cell_index->section == 0) {
        menu = menu_create(RESOURCE_ID_SLEBBLE_LOADING_BLACK,
                           (MenuCallbacks){
                               .select_click = &select_nearby_callback,
                               .remove_callback = &remove_callback_handler,
                           });
    } else {
        menu = menu_create(RESOURCE_ID_SLEBBLE_LOADING_BLACK,
                           (MenuCallbacks){
                               .select_click = NULL,
                               .remove_callback = &remove_callback_handler,
                           });
    }

    menu->menu = temp;

    if (app_comm_get_sniff_interval() == SNIFF_INTERVAL_NORMAL) {
        app_comm_set_sniff_interval(SNIFF_INTERVAL_REDUCED);
    }
    send_appmessage(row_clicked, 0);

    if (cell_index->section != 0) {
        first_tick = false;
        tick_timer_service_subscribe(MINUTE_UNIT, tick_handler);
    }
}

int main(void) {
    menu = menu_create(RESOURCE_ID_SLEBBLE_START_BLACK,
                       (MenuCallbacks){
                           .select_click = &select_callback,
                           .remove_callback = &remove_callback_handler,
                       });

    storage_load(menu);

    event_set_view_func(&menu, &menu_add_data);
    menu_init_text_scroll(&menu);
    event_register_app_message();

    app_event_loop();

    app_message_deregister_callbacks();
}
