#include "pebble.h"
#include "menu.h"
#include "event.h"

Menu *menu;
AppTimer *scroll_timer;
bool first_tick = false;

void tick_handler(struct tm *tick_time, TimeUnits units_changed) {
    if(first_tick) {
        event_tick_handler(menu->size, menu->data_int);
        for(int i = 0; i < menu->size; i++) {
            char buf[32];
            if(((int*)menu->data_int)[i] > 0) {
                snprintf(buf, 32, "%dmin - %s", ((int*)menu->data_int)[i], ((char**)menu->data_char)[i]);
            } else {
                snprintf(buf, 32, "Nu - %s", ((char**)menu->data_char)[i]);
            }
            menu_update(menu, menu->id, menu->size, menu->title, i, buf, menu->row_subtitle[i], ((int*)menu->data_int)[i], ((char**)menu->data_char)[i]);
        }
        menu_layer_reload_data(menu->layer);
        
        update_appmessage();
        
    }
    first_tick = true;
}


void text_scroll_handler(void *data) {
    
    MenuIndex selected_item = menu_layer_get_selected_index(menu->layer);

    if(menu->size > 0) {
        char current_char = *(menu->row_title[selected_item.row]+((uint)text_scroll*sizeof(char)));
        //Fixes åäö edge case
        if(current_char == 195)
            text_scroll++;
    }
    
    if(!(menu->id == 0 && selected_item.section == 0))
        text_scroll++;
    
    if(menu->size > 0 && text_scroll > ((int)strlen(menu->row_title[selected_item.row])) - 17)
        text_scroll = -2;

    
    menu_layer_reload_data(menu->layer);
    scroll_timer = app_timer_register(500, &text_scroll_handler, NULL);
    
}


void remove_callback_handler(void *data) {
    Menu* temp = data;
    menu = temp;
    tick_timer_service_unsubscribe();
}

void select_nearby_callback(MenuLayer *menu_layer, MenuIndex *cell_index, void *data) {
    char *click_data = menu->row_title[cell_index->row];
    int row_clicked = cell_index->row;
    
    event_set_click_data(click_data);

    Menu *temp = menu;
    menu = menu_create(RESOURCE_ID_SLEBBLE_LOADING_BLACK, (MenuCallbacks) {
            .select_click = NULL,
            .remove_callback = &remove_callback_handler,
    });

    menu->menu = temp;

    if (app_comm_get_sniff_interval() == SNIFF_INTERVAL_NORMAL)
        app_comm_set_sniff_interval(SNIFF_INTERVAL_REDUCED);
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
    } else
        click_data = menu->row_title[cell_index->row];

    event_set_click_data(click_data);

    Menu *temp = menu;
    if(cell_index->section == 0) {
        menu = menu_create(RESOURCE_ID_SLEBBLE_LOADING_BLACK, (MenuCallbacks) {
                .select_click = &select_nearby_callback,
                .remove_callback = &remove_callback_handler,
        });
    } else {
        menu = menu_create(RESOURCE_ID_SLEBBLE_LOADING_BLACK, (MenuCallbacks) {
                .select_click = NULL,
                .remove_callback = &remove_callback_handler,
        });
    }

    menu->menu = temp;

    if (app_comm_get_sniff_interval() == SNIFF_INTERVAL_NORMAL)
        app_comm_set_sniff_interval(SNIFF_INTERVAL_REDUCED);
    send_appmessage(row_clicked, 0);

    if(cell_index->section != 0) {
        first_tick = false;
        tick_timer_service_subscribe(MINUTE_UNIT, tick_handler);
    }
}

int main(void) {

    app_message_register_inbox_received(in_received_handler);
    app_message_register_inbox_dropped(in_dropped_handler);

    menu = menu_create(RESOURCE_ID_SLEBBLE_START_BLACK, (MenuCallbacks){
            .select_click = &select_callback,
            .remove_callback = &remove_callback_handler,
    });

    event_set_view_update(&menu, &menu_update);

    scroll_timer = app_timer_register(500, &text_scroll_handler, NULL);

    menu_load_persistent(menu);

    app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());
    app_comm_set_sniff_interval(SNIFF_INTERVAL_REDUCED);

    app_event_loop();
}
