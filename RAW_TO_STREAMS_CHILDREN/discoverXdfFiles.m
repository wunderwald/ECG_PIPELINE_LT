function files = discoverXdfFiles(directory)
    d = dir(directory);
    files = [];
    for f = { d.name }
        filename = string(f);
        if(endsWith(filename, ".xdf"))
            files = [ files filename ];
        end
    end
end

