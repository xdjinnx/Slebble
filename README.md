[![Build Status](https://travis-ci.org/xdjinnx/Slebble.svg?branch=master)](https://travis-ci.org/xdjinnx/Slebble)

# Slebble

[![Slebble is available on the Pebble appstore](http://pblweb.com/badge/5320c36f53fab421d000003a/orange/large)](https://apps.getpebble.com/applications/5320c36f53fab421d000003a)

## Screenshots

![Screenshot1](https://assets.getpebble.com/api/file/BU5C2Em2SyaGGBf9NNT9/convert?cache=true&w=144&h=168&fit=)
![Screenshot2](https://assets.getpebble.com/api/file/uXi2g0mkRbCYpBIdoozF/convert?cache=true&w=144&h=168&fit=)
![Screenshot3](https://assets.getpebble.com/api/file/o5aoCGuRuuVVP7oTHneQ/convert?cache=true&w=144&h=168&fit=)
![Screenshot4](https://assets.getpebble.com/api/file/KxSn79xGRnSZl8YXahUi/convert?cache=true&w=144&h=168&fit=)

## Build & Install
You will need to download and install the Pebble SDK found on the [official Pebble developer website](https://developer.getpebble.com/sdk/install/). It's also recommended that you follow the instructions found on the website.

### No Pebble watch needed
There is an emulator available to use within the Pebble SDK. Instruction on how to use the emulator can be found [here](https://developer.getpebble.com/guides/publishing-tools/pebble-tool/#installing-watchapps) and how to use the settings page can be found [here](https://developer.getpebble.com/guides/pebble-apps/pebblekit-js/app-configuration/#testing-in-the-sdk-emulator).

### Gulp
Before you can build the application you need to run [gulp](http://gulpjs.com/). Gulp installation instructions can be found [here](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md).

The most important part of the gulp execution is the [webpack](https://webpack.github.io/) operation that concatinates the js files.

## Formatting
This project uses [Clang-Format](http://clang.llvm.org/docs/ClangFormat.html).

The _fmt_ bash script should be used to keep consistency in the C code.

## Testing
The Slebble js is tested using the [Jest](https://facebook.github.io/jest/) testing framework. Which practices we are using when testing the private functions in the Slebble js can be found [here](http://philipwalton.com/articles/how-to-unit-test-private-functions-in-javascript/).

Testing of the C code is for now absent. The framework that should be used to test the code is [cmocka](https://cmocka.org/).

## Sponsor
[![Protected by TrackJS JavaScript Error Monitoring](https://trackjs.com/assets/external/badge.gif)](https://trackjs.com/?utm_source=badges)

## License

	Copyright (C) 2014 - 2016  Peter Lundberg

	This program is free software; you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation; either version 2 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License along
	with this program; if not, write to the Free Software Foundation, Inc.,
	51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
