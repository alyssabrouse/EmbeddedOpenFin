# EmbeddedOpenFin
This is a demo based on the openfin [embedding-winforms-demo](https://github.com/openfin/embedding-winforms-demo) repo which did not function properly for me.
It embeds an HTML 5 application and shares data over the OpenFin Runtime Inter Application Bus.  Both the web and winforms projects are included here, rather than using
the openfin CDN for accessing the web app. The web files are updated from those on the CDN, rather than using the web-content folder in the openfin repo.
The demo leverages the OpenFin Runtime, the Openfin.WinForm EmbeddedView control

## 1. Setup EmbeddingWindows
Building the EmbeddingWindows Winforms project in Visual Studio should restore any required NuGet packages.

### 1.1 Setup EmbeddedWeb
Ensure you've downloaded the dependencies required for the server. 
Using a command-line terminal, navigate to the root directory of your EmbeddedWeb project (same level as server.js) and run:

```
$ npm install
```

If you are unfamiliar with using NPM for package dependencies, you can read their documentation [here](https://docs.npmjs.com/getting-started/using-a-package.json).

### 1.2 Run your server
Start the express server. Still in the terminal, type:

```
$ node server
```

## 2. OpenFin Your EmbeddedWeb App

### 2.1 Review the OpenFin config file
Open the **app_local.json** file within the **src** directory, and review the configuration. 

A full list and explanation of configurable properties may be found [here](https://openfin.co/application-config/).

 The crucial properties are:
 
 - **url:** This is the path to the main **index.html** file for the application.
 - **runtime:**{"version":"stable"} This is the version of the runtime you wish to target. "stable" gives you the most recent stable build.
 - **uuid:** This is the unique ID of the app you are running. You cannot have two apps with the same ID running on the same desktop.
 
### 2.2 Create an OpenFin installer

The installer is generated via a url, like this:

```
https://dl.openfin.co/services/download?fileName=openfin-embedded-web&config=http://localhost:9070/app_local.json 
```
The parts of the url are as follows:

- **https://dl.openfin.co/services/download :** The path to OpenFin's app generator-this must not be altered.
- **?fileName=nameOfTheGeneratedInstallerApp :** The name you wish the installer to have once downloaded.
- **&config=http://localhost:9070/app_local.json :** The url to the config file customized in step 2.1.

Navigate to the URL in a web browser. It will download an .exe file. Run the file. You should see the EmbeddedWeb app launched in openfin.

## EmbeddedView

Note that an EmbeddedView control has been coded to render on the screen:
```js
chartEmbeddedView = new EmbeddedView();
panel1.Controls.Add(chartEmbeddedView);
```

### Runtime Options
The Runtime Options object specifies the OpenFin Runtime being used, options include: target runtime (alpha, beta, 32/64 bits...etc), the ability to use remote debugging or specifiying the RVM location, you can read more about options in the openfin [Docs](https://openfin.co/developers/application-config/):
```js
var runtimeOptions = new RuntimeOptions {
	Version = "stable",
	EnableRemoteDevTools = true,
	RemoteDevToolsPort = 9090
};
```

### Application Options
The EmbeddedView will need to be initialized with both the RuntimeOptions object and the ApplicationOptions object.
The Application Options object allows you to configure the OpenFin Application being embedded, options include: name, URL, icon and window options, you can read more about options in the openfin [Docs](https://openfin.co/developers/application-config/):
```js
chartEmbeddedView.Initialize(runtimeOptions, new ApplicationOptions("openfin-embedded-web", "openfin-embedded-web", "http://localhost:9070/chart.html"));
```

### Ready
To programmatically react to when the EmbeddedView has loaded its content, initialized and is ready to be displayed you can subscribe to the Ready event:
```js
chartEmbeddedView.Ready += (sender, e) =>
{
	Utils.InvokeOnUiThreadIfRequired(this, () => { this.lblConnectionStatus.Text = "Connected"; });

	openFinRuntime.InterApplicationBus.subscribe(chartEmbeddedView.OpenfinApplication.getUuid(), "chart-click", (senderUuid, topic, data) =>
	{
		var dataAsJObject = JObject.FromObject(data);
		Utils.InvokeOnUiThreadIfRequired(this, () => {
			label5.Text = string.Format("Key:{0}, {1} at {2}", dataAsJObject.GetValue("key"), dataAsJObject.GetValue("y"), dataAsJObject.GetValue("x"));
		});
	});
};
```

Note how the winform has added a subscription (using the runtime's InterApplicationBus) to the **EmbeddedView** app's **chart-click** topic.
When a topic is received, the label's text is updated using the message data.
