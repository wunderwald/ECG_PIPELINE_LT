# Dashboard for validating and correcting peak detection in ecg signals

## 2 versions of dashboard

There are two versions of the dashboard:

- a: data is stored on the server (ibi_dashboard_online)
- b: data is stored locally and must loaded manually for data privacy (ibi_dashboard)

## Update data for server version (a)

To load new data into the public directory, run 'node dataToDashboardOnline'

## Convert ibi data for data-safe version (b)

To convert the ibi data to the format required by the "offline" dashboard, run 'node ibiDataToInputData'
