describe 'TaskCruncher API', ->
  it 'exists', ->
    expect(CrunchTask).toBeDefined()

  it 'creates instances of CrunchTask class by a simple call', ->
    result = CrunchTask()
    expect(result instanceof CrunchTask).toEqual(true)

  it '.. or by a `new` instantiation', ->
    result = new CrunchTask
    expect(result instanceof CrunchTask).toEqual(true)
