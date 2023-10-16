function xdfToCSV(xdfPath, csvDirectory)
    streams = importXDF(xdfPath);
    for streamIndex = 1:length(streams)       
       try         
            stream = streams{streamIndex};
            name = stream.info.name;

            filename = strcat(csvDirectory, filesep, strrep(name, " ", "_"), ".csv");
            
            timeStamps = stream.time_stamps;
            timeSeries_ = stream.time_series;
            if iscell(timeSeries_)
                table = cell2table([num2cell(timeStamps); timeSeries_]', 'VariableNames', ["Time", "Data"]);
                writetable(table, filename);
            else
                timeSeries = timeSeries_;
                csvData = [timeStamps; timeSeries]';
                csvwrite(filename, csvData);
            end       

        catch e
            disp(e.message);
        end

    end
end

