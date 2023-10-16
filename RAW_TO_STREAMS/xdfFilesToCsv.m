function xdfFilesToCsv(xdfPaths, csvDirectory)
    
    for xdfPath = xdfPaths
        disp(xdfPath);
        
        % make subdirectory for csv output
        path = string(xdfPath);
        pathParts = strsplit(path, "/");
        filename = pathParts(length(pathParts));
        fileParts = strsplit(filename, ".");
        name = fileParts(1);
        subdirPath = csvDirectory+"/"+name;
        if(exist(subdirPath, "dir"))
            rmdir(subdirPath, 's');
        end
        mkdir(csvDirectory, name);
        
        %convert xdf data to csv
        xdfToCSV(xdfPath, subdirPath);
    end
    
end

