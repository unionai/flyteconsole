# Flyte Console Contribution Guide

First off, thank you for thinking about contributing! 
Below you’ll find instructions that will hopefully guide you through how to contribute to, fix, and improve Flyte Console.

## Protobuf and Debug Output

Communication with the Flyte Admin API is done using Protobuf as the
request/response format. Protobuf is a binary format, which means looking at
responses in the Network tab won't be very helpful. To make debugging easier,
each network request is logged to the console with it's URL followed by the
decoded Protobuf payload. You must have debug output enabled (on by default in
development) to see these messages.

This application makes use of the [debug](https://github.com/visionmedia/debug)
libary to provide namespaced **debug output** in the browser console. In
development, all debug output is enabled. For other environments, the debug
output must be enabled manually. You can do this by setting a flag in
localStorage using the console: `localStorage.debug = 'flyte:*'`. Each module in
the application sets its own namespace. So if you'd like to only view output for
a single module, you can specify that one specifically
(ex. ``localStorage.debug = 'flyte:adminEntity'`` to only see decoded Flyte
Admin API requests).

## Storybook

This project has support for [Storybook](https://storybook.js.org/).
Component stories live next to the components they test, in a `__stories__`
directory, with the filename pattern `{Component}.stories.tsx`.

You can run storybook with `yarn run storybook`, and view the stories at http://localhost:9001.

## Feature flags

We are using our internal feature flag solution to allow continuos integration,
while features are in development.
All flags currently available could be found in [/FeatureFlags/defaultConfig.ts](./src/basics/FeatureFlags/defaultConfig.ts)
file. Most of them under active development, which means we don't guarantee it will work as you expect.

If you want to add your own flag, you need to add it to both `enum FeatureFlag` and `defaultFlagConfig`
under production section.
Initally all flags must be disabled, meaning you code path should not be executed by default.

**Example - adding flags:**

```javascript
enum FeatureFlags {
    ...
    AddNewPage: 'add-new-page'
    UseCommonPath: 'use-common-path'
}

export const defaultFlagConfig: FeatureFlagConfig = {
    ...
    'add-new-page': false, // default/prior behavior doesn't include new page
    'use-common-path': true, // default/prior behavior uses common path
};
```

To use flags in code you need to ensure that the most top level component is wrapped by `FeatureFlagsProvider`.
By default we are wrapping top component in Apps file, so if you do not plan to include
feature flags checks in the `\*.tests.tsx` - you should be good to go.
To check flag's value use `useFeatureFlag` hook.

**Example - flag usage**:

```javascript
import { FeatureFlag, useFeatureFlag } from 'basics/FeatureFlags';

export function MyComponent(props: Props): React.ReactNode {
    ...
    const isFlagEnabled = useFeatureFlag(FeatureFlag.AddNewPage);
    
    return isFlagEnabled ? <NewPage ...props/> : null;
}
```

During your local development you can either:
*   temporarily switch flags value in runtimeConfig as:
    ```javascript
    let runtimeConfig = { 
        ...defaultFlagConfig,
        'add-new-page': true,
    };
    ```
* turn flag on/off from the devTools console in Chrome 
![SetFeatureFlagFromConsole](https://user-images.githubusercontent.com/55718143/150002962-f12bbe57-f221-4bbd-85e3-717aa0221e89.gif)

#### Unit tests

If you plan to test non-default flag value in your unit tests, make sure to wrap your component with `FeatureFlagsProvider`.
Use `window.setFeatureFlag(flag, newValue)` function to set needed value and `window.clearRuntimeConfig()`
to return to defaults. Beware to comment out/remove any changes in `runtimeConfig` during testing;

```javascript
function TestWrapper() {
    return <FeatureFlagsProvider> <TestContent /> </FeatureFlagsProvider>
}

describe('FeatureFlags', () => {
    afterEach(() => {
        window.clearRuntimeConfig(); // clean up flags
    });

   it('Test', async () => {
        render(<TestWrapper />);
        
        window.setFeatureFlag(FeatureFlag.FlagInQuestion, true);
        await waitFor(() => {
            // check after flag changed value
        });
    });
```

## Google Analytics

This application makes use of the `react-ga4 <https://github.com/PriceRunner/react-ga4>`_
libary to include Google Analytics tracking code in a website or app. For all the environments, it is configured using ENABLE_GA environment variable.
By default, it's enabled like this: ``ENABLE_GA=true``. If you want to disable it, just set it false. (ex. ``ENABLE_GA=false``).

## 📦 Install Dependencies

Running flyteconsole locally requires [NodeJS](https://nodejs.org) and
[yarn](https://yarnpkg.com). We recommend for you to use **asdf** to manage NodeJS version.
You can find currently used versions in `.tool-versions` file.

* Install asdf through homebrew
``` bash
brew install asdf
```

* (Optional) If you are using **M1 MacBook**, you will need to install `vips` for proper build experience
``` bash
brew install vips
```

* Add Yarn plugin to asdf, to manage yarn versions
``` bash
asdf plugin-add yarn https://github.com/twuni/asdf-yarn.git
brew install gpg
```

* From flyteconsole directory - install proper NodeJS and yarn versions:
``` bash
asdf install
```

* Install nodepackages
``` bash
yarn install
```


## CORS Proxying: Recommended Setup

In the common hosting arrangement, all API requests will be to the same origin
serving the client application, making CORS unnecessary. However, if you would like
to setup your local dev enviornment to target a FlyteAdmin service running on a different
domain you will need to configure your enviornment to support CORS. One example would be
hosting the Admin API on a different domain than the console. Another example is
when fetching execution data from external storage such as S3.

The fastest (recommended) way to setup a CORS solution is to do so within the browser. 
If you would like to handle this at the Node level you will need to disable authentication
(see below).

*NOTE:* Do not configure for both browser and Node solutions. 

These instructions require using Google Chrome. You will also need to identify the 
URL of your target FlyteAdmin API instance. These instructions will use
`https://different.admin.service.com` as an example.


1. Set `ADMIN_API_URL` and `ADMIN_API_USE_SSL`
   
    ```
      export ADMIN_API_URL=https://different.admin.service.com
      export ADMIN_API_USE_SSL="https"
    ```

    *NOTE:* Add these to your local profile (e.g., `./profile`) to prevent having to do this step each time

2. Generate SSL certificate

   Run the following command from your `flyteconsole` directory

    ```bash
      make generate_ssl
    ```

3. Add new record to hosts file

    ```bash      
      sudo vim /etc/hosts
    ```

   Add the following record
   
    ```
      127.0.0.1 localhost.different.admin.service.com
    ```

4. Install Chrome plugin: [Allow CORS: Access-Control-Allow-Origin](https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf)

    >*NOTE:* Activate plugin (toggle to "on")

5. Start `flyteconsole`

    ```bash
      yarn start
    ```

   Your new localhost is [localhost.different.admin.service.com](http://localhost.different.admin.service.com)

> Ensure you don't have `ADMIN_API_URL` or `DISABLE_AUTH` set (e.g., in your `/.profile`.)
