#pragma once

#include "pebble.h"

extern void in_received_handler(DictionaryIterator *iter, void *context);
extern void in_dropped_handler(AppMessageResult reason, void *context);