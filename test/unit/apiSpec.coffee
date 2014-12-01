describe 'TaskCruncher API', ->
  it 'exists', ->
    expect(CrunchTask).toBeDefined()

  it 'creates instances of CrunchTask class by a simple call', ->
    result = CrunchTask()
    expect(result).not.toThrow()
    console.log result
    expect(result of CrunchTask).toEqual(true)

  it '.. or by a `new` instantiation', ->
    result = new CrunchTask()
    expect(result).not.toThrow()
    expect(result is CrunchTask).toEqual(true)
