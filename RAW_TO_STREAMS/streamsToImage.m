function streamsToImage(recordingId, streamsDir, graphicsDir, fileExtension) 

    table0 = readtable(string(streamsDir) + "/" + string(recordingId) + "_channel0.csv");
    table1 = readtable(string(streamsDir) + "/" + string(recordingId) + "_channel1.csv");
    table2 = readtable(string(streamsDir) + "/" + string(recordingId) + "_channel2.csv");
    tableTime = readtable(string(streamsDir) + "/" + string(recordingId) + "_time.csv");

    channel0 = table2array(table0);
    channel1 = table2array(table1);
    channel2 = table2array(table2);
    time = table2array(tableTime);
    
    f = figure('Position', [0, 0, 1280, 960], 'visible', 'off');
    subplot(3, 1, 1);
    plot(time, channel0, 'LineWidth', 1);
    title('Channel 0');
    xlabel('time');
    ylabel('ecg');
    subplot(3, 1, 2);
    plot(time, channel1, 'LineWidth', 1);
    title('Channel 1');
    xlabel('time');
    ylabel('ecg');
    subplot(3, 1, 3);
    plot(time, channel2);
    title('Channel 2', 'LineWidth', 1);
    xlabel('time');
    ylabel('ecg');
    
    saveas(f, string(graphicsDir) + "/" + string(recordingId), fileExtension);
end

