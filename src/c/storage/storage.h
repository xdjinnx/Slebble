#pragma once

#include "../menu/menu.h"
#include "pebble.h"

extern bool storage_load(Menu *menu);
extern void storage_save(Menu *menu);