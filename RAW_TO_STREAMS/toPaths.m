function paths = toPaths(directory, files)
    paths = [];
    for file = files
        paths = [ paths string(directory)+"/"+string(file) ];
    end
end

