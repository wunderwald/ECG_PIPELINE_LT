streams = importXDF('FullTestRecording20200610II.xdf');

timeRanges = zeros(length(streams), 2);

for streamIndex = 1:length(streams)
    stream = streams{streamIndex};

    timeStamps = stream.time_stamps;
    if(length(timeStamps) >= 2)
        first = timeStamps(1);
        last = timeStamps(length(timeStamps));
        range = [first last];
       
        disp("First: ");
        disp(datetime(first, 'convertfrom','posixtime'));
        disp("Last: ");
        disp(datetime(last, 'convertfrom','posixtime'));
        
    else
        range = [0 0];
    end
    
    timeRanges(streamIndex, :) = range;
end

disp(timeRanges);