#include "event.h"

enum SLKey {
    PACKAGE_KEY = 0x0,
    TITLE_KEY = 0x1,
    SUBTITLE_KEY = 0x2,
    INT_KEY = 0x3,
    STRING_KEY = 0x4,
    LAST_KEY = 0x5
};

int queue_size = 0;
Event_Row queue[20];
int expected_package_key = 0;
char *event_data_char = "Favorites";
view_func add_view;
void **view_ptr;

void event_set_view_func(void *view, view_func func) {
    view_ptr = view;
    add_view = func;
}

void event_set_click_data(char* data) {
    event_data_char = data;
}

void in_dropped_handler(AppMessageResult reason, void *context) {
    //APP_LOG(APP_LOG_LEVEL_WARNING, "DROPPED PACKAGE");
}

void in_received_handler(DictionaryIterator *iter, void *context) {

    //APP_LOG(APP_LOG_LEVEL_INFO, "Appmessage recived");

    Tuple *package_tuple = dict_find(iter, PACKAGE_KEY);
    Tuple *title_tuple = dict_find(iter, TITLE_KEY);
    Tuple *subtitle_tuple = dict_find(iter, SUBTITLE_KEY);
    Tuple *int_tuple = dict_find(iter, INT_KEY);
    Tuple *string_tuple = dict_find(iter, STRING_KEY);
    Tuple *last_tuple = dict_find(iter, LAST_KEY);

    if(package_tuple->value->uint8 >= expected_package_key) {

        memcpy(queue[queue_size].title, title_tuple->value->cstring, title_tuple->length);
        memcpy(queue[queue_size].subtitle, subtitle_tuple->value->cstring, subtitle_tuple->length);
        queue[queue_size].data_int = int_tuple->value->int8;
        memcpy(queue[queue_size].data_char, string_tuple->value->cstring, string_tuple->length);

        queue_size++;

        if(last_tuple->value->int8) {
            add_view(*view_ptr, event_data_char, queue, queue_size);
            queue_size = 0;
        }

    }
}

void event_register_app_message() {
  app_message_register_inbox_received(in_received_handler);
  app_message_register_inbox_dropped(in_dropped_handler);

  app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());
  app_comm_set_sniff_interval(SNIFF_INTERVAL_REDUCED);
}

void event_tick_handler(int size, void *data) {
    int *min_left = data;
    for(int i = 0; i < size; i++) {
        if(min_left[i] > 0)
            min_left[i]--;
    }
}

void appmessage(int index, int step, int local_expected_package_key) {
    queue_size = 0;
    Tuplet value1 = TupletInteger(1, index);
    Tuplet value2 = TupletInteger(2, step);
    Tuplet value3 = TupletInteger(3, local_expected_package_key);

    DictionaryIterator *iter;
    app_message_outbox_begin(&iter);

    if (iter == NULL)
        return;

    dict_write_tuplet(iter, &value1);
    dict_write_tuplet(iter, &value2);
    dict_write_tuplet(iter, &value3);
    dict_write_end(iter);

    app_message_outbox_send();
}

void update_appmessage() {
    appmessage(0, 2, expected_package_key);
}

void send_appmessage(int index, int step) {
    appmessage(index, step, ++expected_package_key);
}
