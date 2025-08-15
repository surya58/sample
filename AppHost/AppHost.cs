using Microsoft.Extensions.Hosting;

var builder = DistributedApplication.CreateBuilder(args);

// Configure the dashboard explicitly if needed
if (builder.Environment.EnvironmentName == "Development")
{
    // Ensure dashboard is properly configured
    Environment.SetEnvironmentVariable("ASPNETCORE_URLS", "http://localhost:15100");
}

var apiService = builder.AddProject<Projects.ApiService>("apiservice")
    .WithHttpEndpoint(port: 5518, name: "api-http")
    .WithHttpHealthCheck("/health");

// The Python API is experimental and subject to change
#pragma warning disable ASPIREHOSTINGPYTHON001
var pythonApi = builder.AddPythonApp("pythonapi","../PythonApi","run_app.py")
    .WithHttpEndpoint(port: 8000, name: "python-http", env: "PORT")
    .WithExternalHttpEndpoints();
#pragma warning restore ASPIREHOSTINGPYTHON001

builder.AddNpmApp("web", "../web", "dev")
    .WithReference(apiService)
    .WithReference(pythonApi)
    .WithHttpEndpoint(3000, name: "web-http", env: "PORT")
    .WithExternalHttpEndpoints()
    .PublishAsDockerFile();

builder.Build().Run();
