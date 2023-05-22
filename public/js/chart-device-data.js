/* eslint-disable max-classes-per-file */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */




$(document).ready(() => {
  // if deployed to a site supporting SSL, use wss://
  const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
  const webSocket = new WebSocket(protocol + location.host);

  // A class for holding the last N points of telemetry for a device
  class DeviceData {
    constructor(deviceId) {
      this.deviceId = deviceId;
      this.maxLen = 50;
      this.timeData = new Array(this.maxLen);
      this.PhSensorData = new Array (this.maxLen);
      this.HumiditySensorData = new Array(this.maxLen);
      this.VolumeData = new Array(this.maxLen);
    }

    addData(time, PH, Umidade, Volume) {
      this.timeData.push(time);
      this.PhSensorData.push(PH);
      this.HumiditySensorData.push(Umidade);
      this.VolumeData.push(Volume);
      
      let data;
      let estado_vol;

      for(let i = 0; i <= 50; i++) {
        data = document.getElementById("ph").textContent = this.PhSensorData[i];
        data = document.getElementById("humid").textContent = this.HumiditySensorData[i];
        
        if(this.VolumeData[i] == 1) {
          estado_vol = document.getElementById("vol").innerHTML = "Recipiente cheio!<br>Por gentileza, aguarde para novas leituras";
          document.getElementById('recipiente-img').src = 'img/jar_1.png';


        }
        
        else if(this.VolumeData[i] == 2) {
          estado_vol = document.getElementById("vol").textContent = "Recipiente em nível médio";
          document.getElementById('recipiente-img').src = 'img/jar_2.png';
        }
        
        else if(this.VolumeData[i] == 3) {
          estado_vol = document.getElementById("vol").textContent = "Recipiente em nível baixo";


          document.getElementById('recipiente-img').src = 'img/jar_3.png';

    

          
        }

  
        


      }


      if (this.timeData.length > this.maxLen) {
        this.timeData.shift();
        this.PhSensorData.shift();
        this.HumiditySensorData.shift();
        this.VolumeData.shift();
      }


      
  
    
    }
  }

  // All the devices in the list (those that have been sending telemetry)
  class TrackedDevices {
    constructor() {
      this.devices = [];
    }

    // Find a device based on its Id
    findDevice(deviceId) {
      for (let i = 0; i < this.devices.length; ++i) {
        if (this.devices[i].deviceId === deviceId) {
          return this.devices[i];
        }
      }

      return undefined;
    }

    getDevicesCount() {
      return this.devices.length;
    }
  }

  const trackedDevices = new TrackedDevices();

  // Define the chart axes
  const chartData = {
    datasets: [
      {
        fill: true,
        label: 'PH',
        yAxisID: 'PH',
        borderColor: 'rgba(89, 43, 156, 1)',
        pointBoarderColor: 'rgba(126, 43, 156, 0.4)',
        backgroundColor: 'rgba(126, 43, 156, 0.4)',
        pointHoverBackgroundColor: 'rgba(126, 43, 156, 0.4)',
        pointHoverBorderColor: 'rgba(89, 43, 156, 1)',
        spanGaps: true,
        pointLabel: {
          display: false
        }
      }/* ,
      {
        fill: false,
        label: 'Umidade',
        yAxisID: 'Umidade',
        borderColor: 'rgba(24, 120, 240, 1)',
        pointBoarderColor: 'rgba(24, 120, 240, 1)',
        backgroundColor: 'rgba(24, 120, 240, 0.4)',
        pointHoverBackgroundColor: 'rgba(24, 120, 240, 1)',
        pointHoverBorderColor: 'rgba(24, 120, 240, 1)',
        spanGaps: true,
        pointLabel: {
        display: true
      }
      } */
    ]
  };

  const chartOptions = {
    scales: {
      yAxes: [{
        id: 'PH',
        type: 'linear',
        scaleLabel: {
          labelString: 'Valor PH',
          display: true,
        },
        position: 'left',

        
        
      }/* ,
      {
        id: 'Umidade',
        type: 'linear',
        scaleLabel: {
          labelString: 'Umidade',
          display: true,
        },
        position: 'right',
      } */
    ]
    }
  };

 // Get the context of the canvas element we want to select
  const ctx = document.getElementById('iotChart').getContext('2d');
  const myLineChart = new Chart(
    ctx,
    {
      type: 'line',
      data: chartData,
      options: chartOptions,
    });

  // Manage a list of devices in the UI, and update which device data the chart is showing
  // based on selection
  let needsAutoSelect = true;
  const deviceCount = document.getElementById('deviceCount');
  const listOfDevices = document.getElementById('listOfDevices');
  function OnSelectionChange() {
    const device = trackedDevices.findDevice(listOfDevices[listOfDevices.selectedIndex].text);
    chartData.labels = device.timeData;
    chartData.datasets[0].data = device.PhSensorData;
    //chartData.datasets[1].data = device.HumiditySensorData;
    //chartData.datasets[2].data = device.VolumeData;
    
    
    myLineChart.update();
  }
  listOfDevices.addEventListener('change', OnSelectionChange, false);

  // When a web socket message arrives:
  // 1. Unpack it
  // 2. Validate it has date/time and sensorone
  // 3. Find or create a cached device to hold the telemetry data
  // 4. Append the telemetry data
  // 5. Update the chart UI
  webSocket.onmessage = function onMessage(message) {
    try {
      const messageData = JSON.parse(message.data);
      console.log(messageData);

      // time and either are required
      if (!messageData.MessageDate || (!messageData.IotData.PH && !messageData.IotData.Umidade && !messageData.IotData.Volume)) {
        return;
      }

      // find or add device to list of tracked devices
      const existingDeviceData = trackedDevices.findDevice(messageData.DeviceId);

      if (existingDeviceData) {
        existingDeviceData.addData(messageData.MessageDate, messageData.IotData.PH, messageData.IotData.Umidade, messageData.IotData.Volume);
        } else {
        const newDeviceData = new DeviceData(messageData.DeviceId);
        trackedDevices.devices.push(newDeviceData);
        const numDevices = trackedDevices.getDevicesCount();
        deviceCount.innerText = numDevices === 1 ? `${numDevices} Dispositivo` : `${numDevices} Dispositivos`;
        newDeviceData.addData(messageData.MessageDate, messageData.IotData.PH, messageData.IotData.Umidade, messageData.IotData.Volume);

        // add device to the UI list
        const node = document.createElement('option');
        const nodeText = document.createTextNode(messageData.DeviceId);
        node.appendChild(nodeText);
        listOfDevices.appendChild(node);

        // if this is the first device being discovered, auto-select it
        if (needsAutoSelect) {
          needsAutoSelect = false;
          listOfDevices.selectedIndex = 0;
          OnSelectionChange();
        }
      }

      myLineChart.update();
    } catch (err) {
      console.error(err);
    }
  };
});
