function plotXDF(xdfPath)
    streams = importXDF(xdfPath);
    figure();
    for streamIndex = 1:length(streams)
        
        try
        
            %TODO 
            % - String array from matlab strea, is not accepted yet
            % - Column Names
            
            stream = streams{streamIndex};
            name = stream.info.name;

            timeStamps = stream.time_stamps;
            timeSeries = stream.time_series;

            subplot(length(streams), 1, streamIndex);
            plot(timeStamps, timeSeries);
            title(name);
            
        catch e
            disp(e.message);
        end

    end
end
