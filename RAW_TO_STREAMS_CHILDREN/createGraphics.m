function createGraphics(subjectList, streamsDirectory, graphicsDirectory)
    for k=1:height(subjectList)
        subjectId = string(subjectList{k, 1});
        try
            streamsToImage(string(subjectId), streamsDirectory, graphicsDirectory, "svg");
            streamsToImage(string(subjectId), streamsDirectory, graphicsDirectory, "png");
        catch e
            disp("Failed to create graphics for " + subjectId);
            throw(e);
        end
    end
end

