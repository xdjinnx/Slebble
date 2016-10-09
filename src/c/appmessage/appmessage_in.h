#pragma once

#include "../utils/queue.h"

extern void appmessage_set_click_data(char *data);
extern void appmessage_register_app_message();

extern Queue *appmessage_queue_pointer();
