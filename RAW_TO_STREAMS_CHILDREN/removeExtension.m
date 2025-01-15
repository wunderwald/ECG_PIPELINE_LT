function out = removeExtension(filenames)
    out = [];
    for filename = filenames
        name = string(filename);
        parts = strsplit(name, ".");
        out = [ out parts(1) ];
    end
end

