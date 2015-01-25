#include "pebble.h"
#include "menu.h"
#include "app_message.h"


void tick_handler(struct tm *tick_time, TimeUnits units_changed) {

}

void remove_callback_handler(Menu *menu) {

}

int main(void) {

    //app_message_register_inbox_received(in_received_handler);
    //app_message_register_inbox_dropped(in_dropped_handler);

    menu_create(&remove_callback_handler, RESOURCE_ID_SLEBBLE_START_BLACK);

    tick_timer_service_subscribe(MINUTE_UNIT, tick_handler);

    app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());

	app_event_loop();
}
